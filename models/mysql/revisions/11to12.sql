-- MySQL Workbench Synchronization

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL';

ALTER TABLE `entree_r12`.`orderitemassociations` 
DROP FOREIGN KEY `orderitemassociations_ibfk_1`,
DROP FOREIGN KEY `orderitemassociations_ibfk_2`;

ALTER TABLE `entree_r12`.`categories` 
CHANGE COLUMN `name` `name` VARCHAR(64) NOT NULL ;

ALTER TABLE `entree_r12`.`chatstates` 
CHANGE COLUMN `state` `state` VARCHAR(16) NOT NULL ;

ALTER TABLE `entree_r12`.`itemmods` 
CHANGE COLUMN `name` `name` VARCHAR(32) NOT NULL ;

ALTER TABLE `entree_r12`.`items` 
CHANGE COLUMN `description` `description` VARCHAR(64) NULL DEFAULT NULL ;

ALTER TABLE `entree_r12`.`locations` 
CHANGE COLUMN `address` `address` VARCHAR(64) NOT NULL ,
CHANGE COLUMN `city` `city` VARCHAR(32) NOT NULL ,
CHANGE COLUMN `state` `state` VARCHAR(2) NOT NULL ,
CHANGE COLUMN `zipcode` `zipcode` VARCHAR(5) NOT NULL ;

ALTER TABLE `entree_r12`.`menuitems` 
CHANGE COLUMN `name` `name` VARCHAR(32) NOT NULL ,
CHANGE COLUMN `description` `description` VARCHAR(64) NOT NULL ;

ALTER TABLE `entree_r12`.`mods` 
CHANGE COLUMN `name` `name` VARCHAR(64) NOT NULL ;

ALTER TABLE `entree_r12`.`orderitemassociations` 
CHANGE COLUMN `OrderId` `OrderId` INT(11) NOT NULL DEFAULT '0' ,
CHANGE COLUMN `ItemId` `ItemId` INT(11) NOT NULL DEFAULT '0' ;

ALTER TABLE `entree_r12`.`orders` 
CHANGE COLUMN `message` `message` VARCHAR(64) NULL DEFAULT NULL ,
CHANGE COLUMN `transactionId` `transactionId` VARCHAR(36) NULL DEFAULT NULL ;

ALTER TABLE `entree_r12`.`restauranthours` 
CHANGE COLUMN `dayOfTheWeek` `dayOfTheWeek` VARCHAR(10) NOT NULL ;

ALTER TABLE `entree_r12`.`restaurants` 
CHANGE COLUMN `mode` `mode` ENUM('REGULAR','GOD','UNAVAILABLE') NOT NULL ;

ALTER TABLE `entree_r12`.`orderitemassociations` 
ADD CONSTRAINT `orderitemassociations_ibfk_1`
  FOREIGN KEY (`OrderId`)
  REFERENCES `entree_r12`.`orders` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE,
ADD CONSTRAINT `orderitemassociations_ibfk_2`
  FOREIGN KEY (`ItemId`)
  REFERENCES `entree_r12`.`items` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
