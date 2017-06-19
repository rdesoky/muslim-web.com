use quran;
-------------------------------------------------------
DROP TABLE IF EXISTS members;

CREATE TABLE members
(
	id			INT			AUTO_INCREMENT,
	login_id 	varchar(50) UNIQUE 		NOT NULL,
	password 	varchar(50) NOT NULL,
	email	 	varchar(50),
	date_created	DATE,
	date_updated	DATE,
	machine_id		varchar(80),

	memorize	TEXT,
	pending_memorize	TEXT,

	PRIMARY KEY (id),
	KEY members_idx1 (login_id)
);

