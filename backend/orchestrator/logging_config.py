from __future__ import annotations

import logging


LOG_FORMAT = (
    "%(asctime)s | %(levelname)s | %(name)s | %(message)s"
)
LOG_DATE_FORMAT = "%Y-%m-%d %H:%M:%S"


def configure_logging() -> None:
    root_logger = logging.getLogger()
    if root_logger.handlers:
        root_logger.setLevel(logging.INFO)
        for handler in root_logger.handlers:
            handler.setFormatter(logging.Formatter(LOG_FORMAT, datefmt=LOG_DATE_FORMAT))
        return

    logging.basicConfig(
        level=logging.INFO,
        format=LOG_FORMAT,
        datefmt=LOG_DATE_FORMAT,
    )


def get_logger(name: str) -> logging.Logger:
    configure_logging()
    return logging.getLogger(name)
