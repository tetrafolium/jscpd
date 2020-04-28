import test, {ExecutionContext} from 'ava';
import {readFileSync} from 'fs';
import {spy, stub} from 'sinon';
import {IClone, IOptions, JSCPD} from '..';

let log: any;

const cpd = new JSCPD({reporters : []});

stub(Date.prototype, 'getTime').returns(123123);

test.beforeEach(() => {
  log = console.log;
  console.log = spy();
});

test.afterEach(() => { console.log = log; });

test('should detect clones by source', async (t: ExecutionContext) => {
  const clones: IClone[] = await cpd.detect(
      readFileSync(__dirname + '/../../tests/fixtures/markup.html').toString(),
      {id : '123', format : 'markup'});
  t.is(clones.length, 0);
  const clonesNew: IClone[] = await cpd.detect(
      readFileSync(__dirname + '/../../tests/fixtures/markup.html').toString() +
          ';',
      {id : '1233', format : 'markup'});
  t.is(clonesNew.length, 1);
});

test('should detect clones in javascript files with total reporters',
     async (t: ExecutionContext) => {
       const jscpd: JSCPD = new JSCPD({
         format : [ 'javascript' ],
         reporters : [
           'json', 'xml', 'console', 'consoleFull', 'execTimer', 'verbose',
           'silent', 'html'
         ],
         threshold : 10,
         blame : true
       } as IOptions);
       const clones: IClone[] =
           await jscpd.detectInFiles([ __dirname + '/../../tests/fixtures/' ]);
       clones.map((clone: IClone) => {
         clone.duplicationA.sourceId = clone.format + ':test-pathA';
         clone.duplicationB.sourceId = clone.format + ':test-pathB';
       });
       t.snapshot(clones);
     });

test('should detect clones in one javascript file',
     async (t: ExecutionContext) => {
       const jscpd: JSCPD = new JSCPD({
         format : [ 'javascript' ],
         reporters : [],
         silent : true,
         blame : false
       } as IOptions);
       const clones: IClone[] = await jscpd.detectInFiles(
           [ __dirname + '/../../tests/fixtures/one-file' ]);
       clones.map((clone: IClone) => {
         clone.duplicationA.sourceId = clone.format + ':-pathA';
         clone.duplicationB.sourceId = clone.format + ':-pathB';
       });
       t.snapshot(clones);
     });
