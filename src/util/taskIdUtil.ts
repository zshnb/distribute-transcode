export function getTaskIdByJobId(jobId: string) {
  return jobId.split(':')[0]
}
