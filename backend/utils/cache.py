# -*- coding: utf-8 -*-
"""
Caching Utility for Expensive Analytics Operations

Provides in-memory caching with TTL (Time To Live) support for:
- Segmentation results
- Affinity analysis
- Sentiment analysis
- Persona generation
- Recommendations

Usage:
    from utils.cache import cache
    
    @cache.cached(ttl=300)
    def expensive_computation(data):
        return result
    
    # Manual cache operations
    cache.set('key', value, ttl=300)
    value = cache.get('key')
    cache.delete('key')
    cache.clear()
"""

import time
import hashlib
import json
import threading
from typing import Any, Optional, Callable, Dict, Tuple
from functools import wraps
import logging

logger = logging.getLogger(__name__)


class CacheEntry:
    """Represents a single cache entry with expiration"""
    
    def __init__(self, value: Any, ttl: int):
        self.value = value
        self.expires_at = time.time() + ttl if ttl > 0 else float('inf')
    
    def is_expired(self) -> bool:
        return time.time() > self.expires_at


class InMemoryCache:
    """Thread-safe in-memory cache with TTL support"""
    
    def __init__(self, max_size: int = 1000):
        self._cache: Dict[str, CacheEntry] = {}
        self._lock = threading.RLock()
        self._max_size = max_size
        self._hits = 0
        self._misses = 0
    
    def _generate_key(self, prefix: str, *args, **kwargs) -> str:
        """Generate a unique cache key from arguments"""
        key_data = {
            'prefix': prefix,
            'args': args,
            'kwargs': sorted(kwargs.items())
        }
        key_string = json.dumps(key_data, sort_keys=True, default=str)
        hash_value = hashlib.md5(key_string.encode()).hexdigest()
        return f"{prefix}:{hash_value}"
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        with self._lock:
            entry = self._cache.get(key)
            
            if entry is None:
                self._misses += 1
                return None
            
            if entry.is_expired():
                del self._cache[key]
                self._misses += 1
                return None
            
            self._hits += 1
            return entry.value
    
    def set(self, key: str, value: Any, ttl: int = 300) -> None:
        """Set value in cache with TTL (default 5 minutes)"""
        with self._lock:
            # Evict oldest entries if at capacity
            if len(self._cache) >= self._max_size:
                self._evict_oldest()
            
            self._cache[key] = CacheEntry(value, ttl)
            logger.debug(f"Cache SET: {key} (TTL: {ttl}s)")
    
    def delete(self, key: str) -> bool:
        """Delete key from cache"""
        with self._lock:
            if key in self._cache:
                del self._cache[key]
                logger.debug(f"Cache DELETE: {key}")
                return True
            return False
    
    def clear(self) -> None:
        """Clear all cache entries"""
        with self._lock:
            self._cache.clear()
            logger.info("Cache CLEAR: All entries removed")
    
    def _evict_oldest(self) -> None:
        """Evict oldest or expired entries"""
        current_time = time.time()
        to_delete = []
        
        # First, remove expired entries
        for key, entry in self._cache.items():
            if entry.is_expired():
                to_delete.append(key)
        
        # If still at capacity, remove oldest
        if len(self._cache) - len(to_delete) >= self._max_size:
            sorted_entries = sorted(
                [(k, v.expires_at) for k, v in self._cache.items() if k not in to_delete],
                key=lambda x: x[1]
            )
            to_delete.extend([k for k, _ in sorted_entries[:100]])
        
        for key in to_delete:
            del self._cache[key]
        
        if to_delete:
            logger.debug(f"Cache EVICT: Removed {len(to_delete)} entries")
    
    def cleanup_expired(self) -> int:
        """Remove all expired entries, return count of removed entries"""
        with self._lock:
            expired_keys = [
                key for key, entry in self._cache.items()
                if entry.is_expired()
            ]
            
            for key in expired_keys:
                del self._cache[key]
            
            if expired_keys:
                logger.debug(f"Cache CLEANUP: Removed {len(expired_keys)} expired entries")
            
            return len(expired_keys)
    
    def stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        with self._lock:
            total = self._hits + self._misses
            hit_rate = (self._hits / total * 100) if total > 0 else 0
            
            return {
                'size': len(self._cache),
                'max_size': self._max_size,
                'hits': self._hits,
                'misses': self._misses,
                'hit_rate': f"{hit_rate:.2f}%",
                'utilization': f"{len(self._cache) / self._max_size * 100:.2f}%"
            }
    
    def cleanup_loop(self, interval: int = 60) -> None:
        """Background cleanup loop (run in separate thread)"""
        while True:
            time.sleep(interval)
            self.cleanup_expired()


# Global cache instance
cache = InMemoryCache(max_size=1000)

# Start background cleanup thread
cleanup_thread = threading.Thread(target=cache.cleanup_loop, daemon=True)
cleanup_thread.start()


def cached(ttl: int = 300, prefix: str = 'auto', key_generator: Optional[Callable] = None):
    """
    Decorator for caching function results
    
    Args:
        ttl: Time to live in seconds (default: 300)
        prefix: Key prefix for organization
        key_generator: Optional custom key generator function
    
    Example:
        @cached(ttl=600, prefix='segmentation')
        def compute_rfm_scores(transactions):
            return rfm_df
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key
            if key_generator:
                cache_key = key_generator(*args, **kwargs)
            else:
                func_prefix = prefix if prefix != 'auto' else func.__name__
                cache_key = cache._generate_key(func_prefix, *args, **kwargs)
            
            # Try to get from cache
            cached_result = cache.get(cache_key)
            if cached_result is not None:
                logger.debug(f"Cache HIT: {func.__name__} -> {cache_key[:50]}...")
                return cached_result
            
            # Cache miss - compute result
            logger.debug(f"Cache MISS: {func.__name__} -> {cache_key[:50]}...")
            result = func(*args, **kwargs)
            
            # Store in cache
            cache.set(cache_key, result, ttl)
            
            return result
        
        wrapper.cache_clear = lambda: cache.delete(cache._generate_key(prefix, *args, **kwargs)) if prefix != 'auto' else None
        wrapper.cache_key = lambda *args, **kwargs: cache._generate_key(prefix if prefix != 'auto' else func.__name__, *args, **kwargs)
        
        return wrapper
    return decorator


# Cache key generators for common use cases
def user_upload_key(user_id: str, upload_id: str, operation: str) -> str:
    """Generate cache key for user-upload specific operations"""
    return f"{operation}:{user_id}:{upload_id}"


def user_key(user_id: str, operation: str) -> str:
    """Generate cache key for user-specific operations"""
    return f"{operation}:user:{user_id}"


# Cache invalidation helpers
def invalidate_user_cache(user_id: str, operation_prefix: Optional[str] = None) -> int:
    """
    Invalidate all cache entries for a user
    Returns count of invalidated entries
    """
    with cache._lock:
        to_delete = []
        prefix = f"{operation_prefix}:" if operation_prefix else ""
        
        for key in cache._cache.keys():
            if key.startswith(prefix) and user_id in key:
                to_delete.append(key)
        
        for key in to_delete:
            del cache._cache[key]
        
        logger.info(f"Cache INVALIDATE: Removed {len(to_delete)} entries for user {user_id}")
        return len(to_delete)


def invalidate_upload_cache(user_id: str, upload_id: str) -> int:
    """Invalidate all cache entries for a specific upload"""
    with cache._lock:
        to_delete = []
        pattern = f":{user_id}:{upload_id}"
        
        for key in cache._cache.keys():
            if pattern in key:
                to_delete.append(key)
        
        for key in to_delete:
            del cache._cache[key]
        
        logger.info(f"Cache INVALIDATE: Removed {len(to_delete)} entries for upload {upload_id}")
        return len(to_delete)
