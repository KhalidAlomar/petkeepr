
delimiter ;

SET @db_name = 'petkeep_test';
source data/database/dbdrop.sql;
SELECT 'Dropped DB' AS 'Progress...';
source data/database/dbcreate.sql;
SELECT 'Created DB' AS 'Progress...';

SET @db_name = 'sequelize_test';
source data/database/dbdrop.sql;
SELECT 'Dropped DB' AS 'Progress...';
source data/database/dbcreate.sql;
SELECT 'Created DB' AS 'Progress...';

USE 'petkeep_test';
source data/tables/test_transaction/create.sql;
SELECT 'Created testtransaction table' AS 'Progress...';
source data/tables/test_query/create.sql;
SELECT 'Created testquery table' AS 'Progress...';
