-- MySQL Workbench Synchronization

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL';

ALTER TABLE `entree_r13`.`orderitemassociations` 
DROP FOREIGN KEY `orderitemassociations_ibfk_1`,
DROP FOREIGN KEY `orderitemassociations_ibfk_2`;

ALTER TABLE `entree_r13`.`orderitemassociations` 
CHANGE COLUMN `OrderId` `OrderId` INT(11) NOT NULL ,
CHANGE COLUMN `ItemId` `ItemId` INT(11) NOT NULL ;

ALTER TABLE `entree_r13`.`restaurants` 
CHARACTER SET = utf8 , COLLATE = utf8_general_ci ;

CREATE TABLE IF NOT EXISTS `entree_r13`.`userlocations` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `latitude` DOUBLE NOT NULL,
  `longitude` DOUBLE NOT NULL,
  `default` TINYINT(1) NOT NULL DEFAULT '0',
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  `UserId` INT(11) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `UserId` (`UserId` ASC),
  CONSTRAINT `userlocations_ibfk_1`
    FOREIGN KEY (`UserId`)
    REFERENCES `entree_r13`.`users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

ALTER TABLE `entree_r13`.`users` 
CHANGE COLUMN `phoneNumber` `phoneNumber` VARCHAR(10) NULL DEFAULT NULL ,
ADD COLUMN `fbId` VARCHAR(32) NULL DEFAULT NULL AFTER `customerId`,
ADD UNIQUE INDEX `fbId` (`fbId` ASC);

CREATE TABLE IF NOT EXISTS `entree_r13`.`wishlists` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `placeId` VARCHAR(64) NOT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  `UserId` INT(11) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `UserId` (`UserId` ASC),
  CONSTRAINT `wishlists_ibfk_1`
    FOREIGN KEY (`UserId`)
    REFERENCES `entree_r13`.`users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

ALTER TABLE `entree_r13`.`orderitemassociations` 
ADD CONSTRAINT `orderitemassociations_ibfk_1`
  FOREIGN KEY (`OrderId`)
  REFERENCES `entree_r13`.`orders` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE,
ADD CONSTRAINT `orderitemassociations_ibfk_2`
  FOREIGN KEY (`ItemId`)
  REFERENCES `entree_r13`.`items` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
