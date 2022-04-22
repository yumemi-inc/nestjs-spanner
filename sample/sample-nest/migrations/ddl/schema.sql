CREATE TABLE Singers (
    SingerId     String(MAX) NOT NULL,
    FirstName    STRING(1024),
    LastName     STRING(1024),
    SingerInfo   BYTES(MAX)
) PRIMARY KEY (SingerId);
