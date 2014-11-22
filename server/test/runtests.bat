::test_setup.bat

mysql.exe -uroot -pmysqlrootpass2 < data/database/dbsetup_test.sql 1>data/logs/output.log 2>data/logs/errors.log
node ./node_modules/mocha/bin/mocha --timeout 5000 --recursive