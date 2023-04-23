interface IDevelopers {
  id: number;
  name: string;
  email: string;
}

type TDeveloper = Omit<IDevelopers, "id">;

interface IDeveloperInfo {
  developerId: number;
  devName: string;
  devEmail: string;
  infoSince?: Date | null;
  infoPreferred?: string | null;
}

interface IInfoDevelopers {
  id: number;
  developerSince: Date;
  preferredOS: string;
  developerId?: number;
}

interface IInfoDeveloper {
  since: Date;
  preferreds: "Windows" | "Linux" | "MacOS";
}

interface IProject {
  name: string;
  description: string;
  estimatedTime: string;
  repository: string;
  startDate: Date;
  endDate: Date | null;
  developerId: number;
}

type TProject = Omit<IProject, "endDate">;

type TProjectRes = IProject & { id: number };

type TProjRes = Omit<TProjectRes, "endDate">;

type TOmitId = Omit<IProject, "id">;

interface IProjTech extends TOmitId {
  techId: number | null;
  techName: string | null;
}

interface IDevProj extends IInfoDeveloper, IProjTech {}

interface IUpdateProject {
  name?: string;
  description?: string;
  estimatedTime?: string;
  repository?: string;
  startDate?: Date;
  endDate?: Date | null;
  developerId?: number;
}

interface IProjectTechnologies {
  projectId: number;
  projectName: string;
  projectDescription: string;
  projectEstimatedTime: string;
  projectRepository: string;
  projectStartDate: Date;
  projectEndDate: Date | null;
  projectDeveloperId: number;
  technologyId: number;
  technologyName: string;
}

interface ITechnology {
  id?: number;
  name: string;
}

type TTechs = ITechnology;

interface IProjetcTechnology {
  addedIn: Date;
  technologyId: number;
  projectId: number;
}

export {
  IDevelopers,
  TDeveloper,
  IDeveloperInfo,
  IInfoDevelopers,
  IInfoDeveloper,
  IProject,
  TProject,
  TProjectRes,
  TProjRes,
  IDevProj,
  IUpdateProject,
  IProjectTechnologies,
  ITechnology,
  TTechs,
  IProjetcTechnology,
};
