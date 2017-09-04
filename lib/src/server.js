let express    = require('express');
let app        = express();
let bodyParser = require('body-parser');
const fetch    = require('node-fetch');
let amqp = require('amqplib/callback_api');

let Job = require('./database');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = process.env.PORT || 4026;

let router = express.Router();

app.connection = amqp.connect('amqp://rabbitmq', function(err, conn) {
    if (!conn) {
        // Exit here
    }
    app.queue = conn.createChannel(function(err, ch) {
        var q = 'jobs';

        queueSuccess = ch.assertQueue(q, {durable: true, arguments: {maxLength: 9999}});
        // Note: on Node 6 Buffer.from(msg) should be used
        // ch.sendToQueue(q, new Buffer('Hello World!'));
        // console.log(" [x] Sent 'Hello World!'");
        if (queueSuccess) {
            console.log('Connected to Queue.');
        }
        else {
            console.log('Queue Assert resolving, or has failed.');
        }
        return ch;
    });
});


router.get('/jobs/current', function(req, res) {
    app.queue.prefetch(false);
    console.log('GET jobs');
    let answer = 'No current job.';
    // app.queue.consume('jobs', function(msg) {
    //     jobInfo = JSON.parse(msg.content);
    //
    //     console.log('Totally is a job here.');
    //     console.log(`My job is: ${jobInfo[0]}`);
    //     if (jobInfo) {
    //         answer = `Current job: ${jobInfo[0]}`;
    //     }
    // }, {noAck: false});
    app.queue.get('jobs', {noAck: false}, function(err, msgOrFalse) {
        if ( msgOrFalse ) {
            jobInfo = JSON.parse(msgOrFalse.content);
            console.log(`Current job: ${jobInfo[0]}`);
            res.send(`Current job: ${jobInfo[0]}`);
        }
        else {
            console.log('No current job.');
            res.send('No current job.');
        }
    });

    app.queue.recover();
});

router.delete('/jobs/current', function(req, res) {
    // app.queue.get('jobs')
});

router.delete('/jobs/all', function(req, res) {
    app.queue.ackAll();
    app.queue.purgeQueue('jobs');
})

router.post('/jobs', function(req, res) {
    console.log('POST JOBS');
    if (req.body && req.body.jobName && req.body.code) {
        var newJob = new Job({name: req.body.jobName, code: req.body.code});
        newJob.save(function (err, submittedJob) {
            if (err) {
                res.send('Could not persist job in mongo.');
                return console.error(err);
            }
            else {
                jobArray = [submittedJob.name,
                            submittedJob.code];
                app.queue.sendToQueue('jobs',
                                      new Buffer(JSON.stringify(jobArray)));
            }
        });

        console.log(`Request received: ${req.body.jobName} with code: ${req.body.code}`);
        res.send('Request received.');
    }
    else {
        res.status(400).send('POST request must contain job name, and code as JSON strings.');
    }
});

app.use('/', router);

app.listen(port);
console.log('Running on port ' + port);
