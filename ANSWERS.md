### What kind of authentication for the users will consider if this was a real task?

- JWT
- Session
  Authentication with revalidation for long period. Introduce authorization checks for each message not only during the handshake.

---

### What kind of persistance for the service you will consider if it was a real work task?

Cassandra/Postgre

---

### What strategy for scale-out you will consider if this was a real work task?

For the this project I would focus around first making my services horizontally scalable
introducing containerisation and some sort of elastic orchestration. I would introduce a loadbalancer
infront to spread and manage traffic. An api gateway may also be used to isolate and decouple part of the infra, for future dev. Given the nature of the project message broker would be absolute must like Redis pub/sub or Kafka, it will umbrealla some of the service, and has scaling capabilities out of the box. Also adequate storge solution for the the following case would be Cassandra(heavy write throughput) / Postgresq -transaction consistency. One more caching machanisms/ solutions can be intoduced between in some places in the architecture aswell to easen the load on diffrent component db/other services.

---
