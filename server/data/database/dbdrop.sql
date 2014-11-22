delimiter $$

SET @s = CONCAT('DROP DATABASE IF EXISTS ', @db_name);
PREPARE stmt_drop FROM @s;
EXECUTE stmt_drop;
$$

delimiter ;