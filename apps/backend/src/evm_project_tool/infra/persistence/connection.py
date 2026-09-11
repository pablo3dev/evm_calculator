from psycopg_pool import ConnectionPool


def create_pool(database_url: str) -> ConnectionPool:
    return ConnectionPool(conninfo=database_url)


def close_pool(pool: ConnectionPool) -> None:
    pool.close()
