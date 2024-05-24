const env = {
  aws: {
    credentials: {
      aws_access_key_id: "your access key id",
      aws_secret_access_key: "your secret access key",
    },
    ses: {
      region: "aws ses region",
    },
  },
  redis: {
    host: "localhost",
    port: 6379,
    password: "1234",
    db: 0,
  },
  db: {
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "postgres",
    database: "postgres",
    synchronize: true,
  },
  jwt: {
    api_secret_key: "Token",
  },
};

export default env;
