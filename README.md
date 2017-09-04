# Velathosian Machine Learning Grid
## Brought to you by the Velathosian Security Network
### Keeping all Velathosians Safe, all the time.

Queue:
Jobs are posted to the ml-grid where they are sent to a rabbitmq queue. A job will not be removed from the queue until that job has finished.

Persist jobs in mongodb as well. When job is created, add it as a document to mongo.
Should be an endpoint for showing all previous jobs, maybe with a time range feature. We should persist all results from python running into mongo as well in a different model.

Can persist data in mongo as well. Data for jobs can be a different end point, where post requests with data get persisted in mongo. Each data will have a unique name provided by the request. A job can have associated data with it, and that data will be pulled out of mongo and given to the python program, in some manner.


TODO:
Deploy to AWS:
    Is it possible to deploy the worker on a separate instance than the grid?
Worker:
    Need to be able to format the python code such that it is properly formatted with tabs and newlines. Is there a npm package for this?
    Might be able to use pythonshell package.