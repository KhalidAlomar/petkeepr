::test_setup.bat

mysql.exe -uroot -pmysqlrootpass2 < data/database/dbsetup_develop.sql 1>data/logs/output.log 2>data/logs/errors.log
call sequelize db:migrate
call node data/database/runfixtures
