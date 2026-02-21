#import pymysql
#pymysql.install_as_MySQLdb()


# Loads Celery app when our Django Project starts 
from .celery import app as celery_app

__all__ = ('celery_app',)

