delimiter ;

SET @db_name = 'petkeep_develop';
source data/database/dbdrop.sql;
SELECT 'Dropped develop DB' AS 'Progress...';
source data/database/dbcreate.sql;
SELECT 'Created develop DB' AS 'Progress...';

USE 'petkeep_develop';
/*
 source data/tables/budget/create.sql;
SELECT 'Created budget table' AS 'Progress...';
source data/tables/budget/insertdevelopdata.sql;
*/