import { beforeEach, default as test, ExecutionContext } from 'ava';
import { Command } from 'commander';
import { IOptions } from '../..';
import { getDefaultOptions, prepareOptions } from '../options';

const cli = new Command();

beforeEach(() => {
  cli.parse(process.argv);
});

test('should prepare options for cli', (t: ExecutionContext) => {
  cli.executionId = 'test';
  const options: IOptions = prepareOptions(cli);
  t.snapshot(options);
});

test('should have default options', (t: ExecutionContext) => {
  const options: IOptions = getDefaultOptions();
  t.snapshot(options);
});

test('should make reporters array from string and add time reporter', (t: ExecutionContext) => {
  cli.reporters = '1,2';
  const options: IOptions = prepareOptions(cli);
  t.deepEqual(options.reporters, ['1', '2', 'time']);
});

test('should make ignore patterns array from string', (t: ExecutionContext) => {
  cli.ignore = '1,2';
  const options: IOptions = prepareOptions(cli);
  t.deepEqual(options.ignore, ['1', '2']);
});

test('should make format array from string', (t: ExecutionContext) => {
  cli.format = '1,2';
  const options: IOptions = prepareOptions(cli);
  t.deepEqual(options.format, ['1', '2']);
});

test('should remove console reporters in silent mode', (t: ExecutionContext) => {
  cli.silent = true;
  cli.reporters = 'console';
  const options: IOptions = prepareOptions(cli);
  t.deepEqual(options.reporters, ['silent', 'time']);
});

test('should add reporter for threshold', (t: ExecutionContext) => {
  cli.threshold = true;
  const options: IOptions = prepareOptions(cli);
  t.truthy(options.reporters && options.reporters.includes('threshold'));
});

test('should create formats from string parameter', (t: ExecutionContext) => {
  cli.formatsExts = 'javascript:ww,ss;dart:dd,zz';
  const options: IOptions = prepareOptions(cli);
  console.log(options.formatsExts);
  t.deepEqual(options.formatsExts, {
    dart: ['dd', 'zz'],
    javascript: ['ww', 'ss']
  });
});
