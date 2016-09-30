# IPC Performance Experiment
An experiment to evaluate performance of various IPC protocols, message formats &amp; tools.

Things to test
 - [ ] HTTP - REST
     - [ ] text
          - [x] JSON
          - [ ] XML
     - [ ] binary
          - [ ] MessagePack
          - [ ] BSON
 - [ ] AMQP
     - [ ] RabbitMQ
     - [ ] ZeroMQ
 - [ ] Shared Memory
 - [ ] Pipes


#Things to Test
 - **Average time**
 - **Min Max time**
 - **Memory consumption** (not sure)
 - **Processor Usage** (not sure)

# Result So far (in ms)
**HTTP-REST TEXT JSON**
Test was done in local setup. With following configuration:
**Processor**: `Inter(R) Xeon(R) CPU E5-1650 v3 @ 3.5GHz`
**RAM**: `32GB`
**OS**: `Windows 10`

Result
```json
min {"timetoRecieve":1,"timetoAck":4,"rttTime":6}
max {"timetoRecieve":57,"timetoAck":38,"rttTime":74}
average {"timetoRecieve":4.502,"timetoAck":12.669,"rttTime":17.171}
```
