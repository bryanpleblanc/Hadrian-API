import { HttpException } from '@exceptions/HttpException';
import { JobSchema, JobListSchema } from '@interfaces/job.interface';
import fs from 'fs';
import path from 'path';
import { Graph, alg as graphlibAlg } from 'graphlib';
const filePath = '../../data/jobs.json';


interface Operation {
  id: string;
  name: string;
  duration: number;
}

interface Dependency {
  from: string;
  to: string;
}

interface Job {
  operations: Operation[];
  dependencies: Dependency[];
}

class JobList {
  jobId: string;
  operations: Operation[];
  dependencies: Dependency[];
  criticalPath: Operation[];

  constructor(jobId: string, operations: Operation[], dependencies: Dependency[], criticalPath: Operation[]) {
    this.jobId = jobId;
    this.operations = operations;
    this.dependencies = dependencies;
    this.criticalPath = criticalPath;
  }
}

function buildDagAndFindCriticalPath(job: Job): Operation[] {
  // Create a new directed graph
  const graph = new Graph();

  // Add operations as nodes
  job.operations.forEach((operation) => {
    graph.setNode(operation.id, operation);
  });

  // Add dependencies as edges
  job.dependencies.forEach((dependency) => {
    graph.setEdge(dependency.from, dependency.to);
  });

  // Compute the longest path for each node
  const longestPath = new Map<string, number>();
  job.operations.forEach((operation) => {
    longestPath.set(operation.id, 0);
  });

  const sortedNodes = graphlibAlg.topsort(graph);
  sortedNodes.forEach((nodeId) => {
    const node = graph.node(nodeId) as Operation;
    graph.predecessors(nodeId).forEach((predecessorId) => {
      const predecessor = graph.node(predecessorId) as Operation;
      const pathDuration = longestPath.get(predecessorId)! + predecessor.duration;
      if (pathDuration > longestPath.get(nodeId)!) {
        longestPath.set(nodeId, pathDuration);
      }
    });
  });

  // Find the critical path
  const criticalPathIds: string[] = [];
  let currentNodeId = sortedNodes[sortedNodes.length - 1];

  while (currentNodeId) {
    criticalPathIds.push(currentNodeId);
    const predecessors = graph.predecessors(currentNodeId);
    if (!predecessors.length) break;

    currentNodeId = predecessors.reduce((maxNodeId, predecessorId) => {
      if (longestPath.get(predecessorId)! > longestPath.get(maxNodeId)!) {
        return predecessorId;
      }
      return maxNodeId;
    }, predecessors[0]);
  }

  criticalPathIds.reverse();

  // Convert the critical path IDs back to operations
  const criticalPath = criticalPathIds.map((id) =>
    job.operations.find((operation) => operation.id === id),
  ) as Operation[];

  return criticalPath;
}


class JobService {
  private readonly pathToFile = path.resolve(__dirname, filePath);

  public async findAllJob(): Promise<JobListSchema[]> {
    try {
      const data = await fs.promises.readFile(this.pathToFile, 'utf-8');
      const jobData = JSON.parse(data);
  
      // Create JobList objects and compute the critical path for each job
      return jobData.map((job: any) => {
        const currentJob: Job = {
          operations: job.operations,
          dependencies: job.dependencies,
        };
        const criticalPath = buildDagAndFindCriticalPath(currentJob);
        return new JobList(job.jobId, job.operations, job.dependencies, criticalPath);
      });
    } catch (e) {
      throw new HttpException(400, 'file not found');
    }
  }

  public async updateJob(jobId: string): Promise<void> {
  
  }

  // public async findJobByQuery(query?: string): Promise<JobList> {
  //   try {
  //     const data = await fs.promises.readFile(pathToFile);
  //     const jobData = JSON.parse(data.toString());

  //     console.log(query);
  //     const filtered: Job[] = jobData.jobs.filter(job => {
  //       return job.title.includes(query) || job.description.includes(query) || job.priority.includes(query);
  //     });

  //     return { jobs: filtered };
  //   } catch (e) {
  //     console.log(e);
  //     throw new HttpException(400, 'file not found');
  //   }
  // }

  // public async createJob(jobData: Job): Promise<void> {
  //   const job = jobData;
  //   if (!job.id || !job.title || !job.description || !job.dueDate || !job.priority) {
  //     throw new HttpException(400, 'job is missing fields');
  //   }
  //   const data = await fs.promises.readFile(pathToFile);
  //   const jobFileData = JSON.parse(data.toString());
  //   console.log(jobFileData);
  //   jobFileData.jobs.push(job);
  //   fs.writeFileSync(pathToFile, JSON.stringify(jobFileData));
  // }

  // public async deleteJob(jobId: string): Promise<void> {
  //   const data = await fs.promises.readFile(pathToFile);
  //   const jobFileData = JSON.parse(data.toString());
  //   const index = jobFileData.jobs.findIndex(job => job.id === jobId);

  //   if (index === -1) {
  //     throw new HttpException(409, "Job doesn't exist");
  //   }
  //   jobFileData.jobs.splice(index, 1);
  //   fs.writeFileSync(pathToFile, JSON.stringify(jobFileData));
  // }
}

export default JobService;
