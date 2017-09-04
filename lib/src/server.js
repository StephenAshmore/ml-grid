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

        queueSuccess = ch.assertQueue(q, {durable: false});
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
    console.log('GET jobs');
    app.queue.consume('jobs', function(msg) {
        jobInfo = JSON.parse(msg.content);
        console.log(`Current Job: ${jobInfo[0]}`);
        if (jobInfo) {
            res.send(`Current job: ${jobInfo[0]}`);
        }
        else {
            res.send('No current job.');
        }
    }, noAck=false);
});

router.post('/jobs', function(req, res) {
    console.log('POST JOBS');
    if (req.body && req.body.jobName && req.body.code) {
        console.log(typeof Job);

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

        res.send('Request received.');
    }
    else {
        res.status(400).send('POST request must contain job name, and code as JSON strings.');
    }
});

app.use('/', router);

app.listen(port);
console.log('Running on port ' + port);
