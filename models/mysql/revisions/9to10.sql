-- MySQL Workbench Synchronization

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL';

ALTER TABLE `entree_r10`.`Orders`
ADD COLUMN `id2` INT(11) NOT NULL AFTER `message`;

ALTER TABLE `entree_r10`.`Restaurants`
CHANGE COLUMN `name` `name` VARCHAR(64) NOT NULL ,
CHANGE COLUMN `handle` `handle` VARCHAR(25) NOT NULL ,
CHANGE COLUMN `password` `password` VARCHAR(64) NOT NULL ,
CHANGE COLUMN `phoneNumber` `phoneNumber` VARCHAR(10) NULL DEFAULT NULL ,
CHANGE COLUMN `mode` `mode` ENUM('REGULAR','GOD') NOT NULL ,
CHANGE COLUMN `merchantId` `merchantId` VARCHAR(32) NULL DEFAULT NULL ,
ADD COLUMN `orderCounter` INT(11) NULL DEFAULT '1' AFTER `transactionFee`;

ALTER TABLE `entree_r10`.`Sizes`
CHANGE COLUMN `name` `name` VARCHAR(16) NOT NULL ;

ALTER TABLE `entree_r10`.`Users`
CHANGE COLUMN `phoneNumber` `phoneNumber` VARCHAR(10) NOT NULL ,
CHANGE COLUMN `firstName` `firstName` VARCHAR(64) NULL DEFAULT NULL ,
CHANGE COLUMN `lastName` `lastName` VARCHAR(64) NULL DEFAULT NULL ,
CHANGE COLUMN `email` `email` VARCHAR(128) NULL DEFAULT NULL ,
CHANGE COLUMN `customerId` `customerId` VARCHAR(36) NULL DEFAULT NULL ;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
