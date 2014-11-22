delimiter $$

SET @s = CONCAT('CREATE DATABASE IF NOT EXISTS ', @db_name);
PREPARE stmt_create FROM @s;
EXECUTE stmt_create;
$$

delimiter ;