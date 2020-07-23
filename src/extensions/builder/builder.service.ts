import { EnvService, ExecutionContext } from '../environments';
import { IsolatorExtension } from '../isolator';
import { Workspace } from '../workspace';
import { BuildPipe } from './build-pipe';
import { LogPublisher } from '../types';
import { BuildTask } from './types';
import { TaskSlot } from './builder.extension';

export class BuilderService implements EnvService {
  constructor(
    /**
     * isolator extension.
     */
    private isolator: IsolatorExtension,

    /**
     * workspace extension.
     */
    private workspace: Workspace,

    /**
     * logger extension.
     */
    private logger: LogPublisher,

    /**
     * task slot (e.g tasks registered by other extensions.).
     */
    private taskSlot: TaskSlot
  ) {}

  /**
   * runs a pipeline of tasks on all components in the execution context.
   */
  async run(context: ExecutionContext) {
    // make build pipe accessible throughout the context.
    if (!context.env.getPipe) {
      throw new Error(`Builder service expects ${context.id} to implement getPipe()`);
    }
    const buildTasks: BuildTask[] = context.env.getPipe(context);
    // merge with extension registered tasks.
    const mergedTasks = buildTasks.concat(this.taskSlot.values());
    const buildPipe = BuildPipe.from(mergedTasks, this.logger);
    this.logger.info(
      context.id,
      `start running building pipe for "${context.id}". total ${buildPipe.tasks.length} tasks`
    );

    const buildContext = Object.assign(context, {
      capsuleGraph: await this.workspace.createNetwork(
        context.components.map((component) => component.id.toString()),
        {
          peerDependencies: true,
        }
      ),
    });

    const components = await buildPipe.execute(buildContext);

    return { id: context.id, components };
  }
}
