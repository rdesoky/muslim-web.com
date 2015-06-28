DROP TABLE IF EXISTS memorizer;

CREATE TABLE memorizer
(
	id			INT AUTO_INCREMENT,
	user_id		varchar(100),
	mem_date	DATE,

	mem_words	INT,
	total_words	INT,

	PRIMARY KEY (id),
	UNIQUE KEY(user_id, mem_date)
);