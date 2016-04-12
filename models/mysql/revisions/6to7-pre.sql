-- MySQL Workbench Synchronization

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL';

-- http://dev.mysql.com/doc/refman/5.7/en/cursors.html
DELIMITER $$
DROP PROCEDURE IF EXISTS GENERATEDEFAULTHANDLE $$
CREATE PROCEDURE GENERATEDEFAULTHANDLE()
BEGIN
  DECLARE rid INT;
  DECLARE rname VARCHAR(64);
  DECLARE done INT DEFAULT FALSE;
  DECLARE curs CURSOR FOR SELECT id, name FROM `entree_r7`.`Restaurants` WHERE handle IS NULL;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

  OPEN curs;

  update_loop: LOOP
  	FETCH curs INTO rid, rname;
    IF done THEN LEAVE update_loop;
    END IF;
    UPDATE `entree_r7`.`Restaurants` SET handle=rname WHERE id=rid;
  END LOOP update_loop;
  CLOSE curs;
END $$
DELIMITER ;

CALL GENERATEDEFAULTHANDLE();

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;