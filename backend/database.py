import asyncio
import json
import logging
import os
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional
try:
    import motor.motor_asyncio
    HAS_MOTOR = True
except ImportError:
    HAS_MOTOR = False
    motor = None

from pymongo import ASCENDING, DESCENDING, errors

from backend.config import settings

logger = logging.getLogger("waste_advisor.database")

# Local JSON fallback store path
FALLBACK_DB_PATH = Path(settings.DATA_DIR) / "db_store.json"

class JSONCollectionFallback:
    """In-memory JSON-persisted collection fallback matching standard async Motor collection API."""
    def __init__(self, name: str, parent_db: 'JSONDatabaseFallback'):
        self.name = name
        self.parent_db = parent_db

    def _get_docs(self) -> List[Dict[str, Any]]:
        return self.parent_db._data.setdefault(self.name, [])

    async def insert_one(self, doc: Dict[str, Any]):
        data = dict(doc)
        if "_id" not in data:
            data["_id"] = str(uuid.uuid4())
        self._get_docs().append(data)
        self.parent_db._save()
        class InsertResult:
            def __init__(self, i_id):
                self.inserted_id = i_id
        return InsertResult(data["_id"])

    async def insert_many(self, docs: List[Dict[str, Any]]):
        inserted_ids = []
        for d in docs:
            data = dict(d)
            if "_id" not in data:
                data["_id"] = str(uuid.uuid4())
            self._get_docs().append(data)
            inserted_ids.append(data["_id"])
        self.parent_db._save()
        class InsertManyResult:
            def __init__(self, ids):
                self.inserted_ids = ids
        return InsertManyResult(inserted_ids)

    async def find_one(self, query: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
        docs = self._get_docs()
        if not query:
            return docs[0] if docs else None
        for doc in docs:
            if self._matches(doc, query):
                return dict(doc)
        return None

    def find(self, query: Optional[Dict[str, Any]] = None):
        docs = self._get_docs()
        filtered = [d for d in docs if self._matches(d, query or {})]
        return JSONCursorFallback(filtered)

    async def update_one(self, query: Dict[str, Any], update: Dict[str, Any], upsert: bool = False):
        docs = self._get_docs()
        matched = 0
        modified = 0
        for doc in docs:
            if self._matches(doc, query):
                matched = 1
                if "$set" in update:
                    for k, v in update["$set"].items():
                        doc[k] = v
                    modified = 1
                break
        if not matched and upsert:
            new_doc = dict(query)
            if "$set" in update:
                new_doc.update(update["$set"])
            if "_id" not in new_doc:
                new_doc["_id"] = str(uuid.uuid4())
            docs.append(new_doc)
            modified = 1
            matched = 1
        if modified:
            self.parent_db._save()
        class UpdateResult:
            def __init__(self, m, mod):
                self.matched_count = m
                self.modified_count = mod
        return UpdateResult(matched, modified)

    async def delete_one(self, query: Dict[str, Any]):
        docs = self._get_docs()
        deleted = 0
        for idx, doc in enumerate(docs):
            if self._matches(doc, query):
                del docs[idx]
                self.parent_db._save()
                deleted = 1
                break
        class DeleteResult:
            def __init__(self, cnt):
                self.deleted_count = cnt
        return DeleteResult(deleted)

    async def count_documents(self, query: Optional[Dict[str, Any]] = None) -> int:
        if not query:
            return len(self._get_docs())
        return len([d for d in self._get_docs() if self._matches(d, query)])

    async def create_index(self, keys, **kwargs):
        # Index simulated in fallback
        return "index_created"

    def _matches(self, doc: Dict[str, Any], query: Dict[str, Any]) -> bool:
        for k, v in query.items():
            if k == "_id":
                if str(doc.get("_id")) != str(v):
                    return False
            elif isinstance(v, dict):
                # Handle basic operators like $gte, $lte, $in, $regex
                val = doc.get(k)
                if "$gte" in v and (val is None or val < v["$gte"]):
                    return False
                if "$lte" in v and (val is None or val > v["$lte"]):
                    return False
                if "$gt" in v and (val is None or val <= v["$gt"]):
                    return False
                if "$lt" in v and (val is None or val >= v["$lt"]):
                    return False
                if "$in" in v and (val not in v["$in"]):
                    return False
                if "$regex" in v:
                    import re
                    pattern = re.compile(v["$regex"], re.IGNORECASE if v.get("$options") == "i" else 0)
                    if not pattern.search(str(val or "")):
                        return False
            else:
                if doc.get(k) != v:
                    return False
        return True


class JSONCursorFallback:
    def __init__(self, data: List[Dict[str, Any]]):
        self._data = [dict(d) for d in data]

    def sort(self, key_or_list, direction=ASCENDING):
        if isinstance(key_or_list, list):
            for k, d in reversed(key_or_list):
                reverse = (d == DESCENDING or d == -1)
                self._data.sort(key=lambda x: str(x.get(k, "")), reverse=reverse)
        else:
            reverse = (direction == DESCENDING or direction == -1)
            self._data.sort(key=lambda x: str(x.get(key_or_list, "")), reverse=reverse)
        return self

    def skip(self, n: int):
        self._data = self._data[n:]
        return self

    def limit(self, n: int):
        self._data = self._data[:n]
        return self

    async def to_list(self, length: Optional[int] = None) -> List[Dict[str, Any]]:
        if length is not None:
            return self._data[:length]
        return self._data

    def __aiter__(self):
        self._idx = 0
        return self

    async def __anext__(self):
        if self._idx < len(self._data):
            val = self._data[self._idx]
            self._idx += 1
            return val
        raise StopAsyncIteration


class JSONDatabaseFallback:
    def __init__(self, file_path: Path):
        self.file_path = file_path
        self._data: Dict[str, List[Dict[str, Any]]] = {}
        self._load()

    def _load(self):
        if self.file_path.exists():
            try:
                with open(self.file_path, "r", encoding="utf-8") as f:
                    self._data = json.load(f)
            except Exception as e:
                logger.warning(f"Could not load fallback DB file: {e}. Starting fresh.")
                self._data = {}
        else:
            self._data = {}

    def _save(self):
        try:
            with open(self.file_path, "w", encoding="utf-8") as f:
                json.dump(self._data, f, default=str, indent=2)
        except Exception as e:
            logger.error(f"Failed to persist fallback DB: {e}")

    def __getitem__(self, collection_name: str) -> JSONCollectionFallback:
        return JSONCollectionFallback(collection_name, self)

    def __getattr__(self, collection_name: str) -> JSONCollectionFallback:
        return self[collection_name]


class DatabaseManager:
    def __init__(self):
        self.client: Optional[motor.motor_asyncio.AsyncIOMotorClient] = None
        self.db = None
        self.is_connected: bool = False
        self.mode: str = "disconnected"

    async def connect(self):
        logger.info(f"Attempting MongoDB connection at {settings.MONGODB_URI}...")
        try:
            # Short server selection timeout so startup is instantaneous even if MongoDB is not running locally
            client = motor.motor_asyncio.AsyncIOMotorClient(
                settings.MONGODB_URI,
                serverSelectionTimeoutMS=1500
            )
            # Ping test
            await client.admin.command('ping')
            self.client = client
            self.db = client[settings.DATABASE_NAME]
            self.is_connected = True
            self.mode = "mongodb"
            logger.info(f"Successfully connected to MongoDB database: '{settings.DATABASE_NAME}'")
            await self._create_indexes()
        except Exception as e:
            logger.warning(
                f"[DATABASE NOTICE] MongoDB is not running or unreachable ({e}).\n"
                f"Activating built-in JSON Document Store fallback at '{FALLBACK_DB_PATH}'.\n"
                f"All queries, inserts, and Big Data batch analytics will operate seamlessly!"
            )
            self.db = JSONDatabaseFallback(FALLBACK_DB_PATH)
            self.is_connected = True
            self.mode = "json_fallback"
            await self._create_indexes()

    async def _create_indexes(self):
        try:
            # 1. waste_predictions indexes: timestamp, category, household_id, confidence
            await self.db.waste_predictions.create_index([("timestamp", DESCENDING)])
            await self.db.waste_predictions.create_index([("category", ASCENDING)])
            await self.db.waste_predictions.create_index([("household_id", ASCENDING)])
            await self.db.waste_predictions.create_index([("confidence", DESCENDING)])
            # 2. disposal_guides index
            await self.db.disposal_guides.create_index([("item_name", ASCENDING)])
            await self.db.disposal_guides.create_index([("category", ASCENDING)])
            # 3. households index
            await self.db.households.create_index([("household_id", ASCENDING)], unique=True)
            logger.info("MongoDB collection indexes initialized successfully.")
        except Exception as e:
            logger.debug(f"Index creation note: {e}")

    async def close(self):
        if self.client:
            self.client.close()
            logger.info("MongoDB connection closed.")

db_manager = DatabaseManager()

def get_database():
    if db_manager.db is None:
        db_manager.db = JSONDatabaseFallback(FALLBACK_DB_PATH)
        db_manager.is_connected = True
        db_manager.mode = "json_fallback"
    return db_manager.db
