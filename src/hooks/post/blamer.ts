import Blamer from 'blamer';
import {yellow} from 'colors/safe';
import {IClone} from '../..';
import {IBlamedLines} from '../../interfaces/blame.interface';
import {IPostHook} from '../../interfaces/post-hook.interface';

export class BlamerPostHook implements IPostHook {
  public async use(clones: IClone[]): Promise<any> {
    return await Promise.all(
        clones.map((clone: IClone) => { return this.matchClone(clone); }));
  }

  private matchClone(clone: IClone): Promise<IClone> {
    const blamer = new Blamer();

    const blameFileA = blamer.blameByFile(clone.duplicationA.sourceId);
    const blameFileB = blamer.blameByFile(clone.duplicationB.sourceId);

    return Promise.all([ blameFileA, blameFileB ])
        .then(([ blamedFileA, blamedFileB ]) => {
          const cloneBlamed: IClone = {
            ...clone,
            duplicationA : {
              ...clone.duplicationA,
              blame : getBlamedLines(blamedFileA, clone.duplicationA.start.line,
                                     clone.duplicationA.end.line)
            },
            duplicationB : {
              ...clone.duplicationB,
              blame : getBlamedLines(blamedFileB, clone.duplicationB.start.line,
                                     clone.duplicationB.end.line)
            }
          };
          return cloneBlamed;
        })
        .catch((error: any) => {
          console.log(yellow(`Blamer ${error.error}`));
          return Promise.resolve(clone);
        });
  }
}

function getBlamedLines(blamedFiles: {[key: string]: IBlamedLines},
                        start: number, end: number): IBlamedLines {
  const [file] = Object.keys(blamedFiles);
  const result: IBlamedLines = {};
  Object.keys(blamedFiles[file])
      .filter(lineNumber => {
        return Number(lineNumber) >= start && Number(lineNumber) <= end;
      })
      .map(lineNumber => blamedFiles[file][lineNumber])
      .forEach(info => { result[info.line] = info; });
  return result;
}
