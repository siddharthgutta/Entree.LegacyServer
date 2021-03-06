-- MySQL Workbench Synchronization

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL';

ALTER TABLE `entree_r6`.`Categories`
CHANGE COLUMN `name` `name` VARCHAR(64) NOT NULL ;

ALTER TABLE `entree_r6`.`ChatStates`
CHANGE COLUMN `state` `state` VARCHAR(16) NOT NULL ;

ALTER TABLE `entree_r6`.`ItemMods`
CHANGE COLUMN `name` `name` VARCHAR(32) NOT NULL ;

ALTER TABLE `entree_r6`.`Items`
CHANGE COLUMN `name` `name` VARCHAR(64) NOT NULL ,
CHANGE COLUMN `description` `description` VARCHAR(64) NULL DEFAULT NULL ;

ALTER TABLE `entree_r6`.`Locations`
CHANGE COLUMN `address` `address` VARCHAR(64) NOT NULL ,
CHANGE COLUMN `city` `city` VARCHAR(32) NOT NULL ,
CHANGE COLUMN `state` `state` VARCHAR(2) NOT NULL ,
CHANGE COLUMN `zipcode` `zipcode` VARCHAR(5) NOT NULL ;

ALTER TABLE `entree_r6`.`MenuItems`
CHANGE COLUMN `name` `name` VARCHAR(32) NOT NULL ,
CHANGE COLUMN `description` `description` VARCHAR(64) NOT NULL ;

ALTER TABLE `entree_r6`.`Mods`
CHANGE COLUMN `name` `name` VARCHAR(64) NOT NULL ;

ALTER TABLE `entree_r6`.`OrderItems`
CHANGE COLUMN `name` `name` VARCHAR(128) NOT NULL ;

ALTER TABLE `entree_r6`.`Orders`
CHANGE COLUMN `status` `status` ENUM('PENDING_PAYMENT','FAILED_PAYMENT','RECEIVED_PAYMENT','ACCEPTED','DECLINED','COMPLETED') NOT NULL ,
CHANGE COLUMN `message` `message` VARCHAR(64) NULL DEFAULT NULL ,
CHANGE COLUMN `transactionId` `transactionId` VARCHAR(36) NULL DEFAULT NULL ;

ALTER TABLE `entree_r6`.`RestaurantHours`
CHANGE COLUMN `dayOfTheWeek` `dayOfTheWeek` VARCHAR(10) NOT NULL ;

ALTER TABLE `entree_r6`.`Restaurants`
CHANGE COLUMN `name` `name` VARCHAR(64) NOT NULL ,
CHANGE COLUMN `password` `password` VARCHAR(64) NOT NULL ,
CHANGE COLUMN `phoneNumber` `phoneNumber` VARCHAR(10) NULL DEFAULT NULL ,
CHANGE COLUMN `mode` `mode` ENUM('REGULAR','GOD') NOT NULL ,
CHANGE COLUMN `merchantId` `merchantId` VARCHAR(32) NULL DEFAULT NULL ,
ADD COLUMN `handle` VARCHAR(25) NULL DEFAULT NULL AFTER `name`,
ADD UNIQUE INDEX `handle` (`handle` ASC);

ALTER TABLE `entree_r6`.`Sizes`
CHANGE COLUMN `name` `name` VARCHAR(16) NOT NULL ;

ALTER TABLE `entree_r6`.`Users`
CHANGE COLUMN `phoneNumber` `phoneNumber` VARCHAR(10) NOT NULL ,
CHANGE COLUMN `firstName` `firstName` VARCHAR(64) NULL DEFAULT NULL ,
CHANGE COLUMN `lastName` `lastName` VARCHAR(64) NULL DEFAULT NULL ,
CHANGE COLUMN `email` `email` VARCHAR(128) NULL DEFAULT NULL ,
CHANGE COLUMN `customerId` `customerId` VARCHAR(36) NULL DEFAULT NULL ;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
