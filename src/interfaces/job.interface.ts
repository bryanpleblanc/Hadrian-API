export interface JobSchema {
  id: string;
  title: string;
  description: string;
  priority: string;
  dueDate: string;
}

export interface JobListSchema {
  jobs?: JobSchema[];
}
