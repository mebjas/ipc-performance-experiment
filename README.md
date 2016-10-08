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
{
    "min" : {"timetoRecieve":175,"timetoAck":56,"rttTime":304},
    "max" : {"timetoRecieve":292,"timetoAck":241,"rttTime":488},
    "average" : {"timetoRecieve":234.125,"timetoAck":131.681,"rttTime":363.142}
}
```
