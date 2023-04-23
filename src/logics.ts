import { Request, Response } from "express";
import format from "pg-format";
import { QueryConfig, QueryResult } from "pg";
import { client } from "./database";
import {
  IDeveloperInfo,
  IDevelopers,
  IInfoDevelopers,
  IProject,
  IProjectTechnologies,
  IProjetcTechnology,
  ITechnology,
  IUpdateProject,
  TDeveloper,
  TProjRes,
  TProject,
  TProjectRes,
} from "./interfaces";
const createDevelopers = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const developerData: TDeveloper = req.body;
  const queryString: string = format(
    `
      INSERT INTO 
        developers(%I)
      VALUES
        (%L)
      RETURNING *;
    `,
    Object.keys(developerData),
    Object.values(developerData)
  );
  const queryResult: QueryResult<IDevelopers> = await client.query(queryString);
  return res.status(201).json(queryResult.rows[0]);
};
const listDevelopers = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const queryString: string = `
  SELECT
  dev."id" AS "developerId",
  dev."name" AS "developerName",
  dev."email" AS "developerEmail",
  "devInf"."developerSince" AS "developerInfoDeveloperSince",
  "devInf"."preferredOS" AS "developerInfoPreferredOS"
  FROM
    developer_infos "devInf"
  RIGHT JOIN
    developers dev ON "devInf"."developerId" = dev."id"
  WHERE dev."id"=$1;
  `;
  const queryResult: QueryResult<IDeveloperInfo> = await client.query(
    queryString,
    [id]
  );
  return res.json(queryResult.rows[0]);
};
const updateDevelopers = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const developerData: TDeveloper = req.body;
  const id: number = parseInt(req.params.id);
  const queryString: string = format(
    `
      UPDATE
        developers
      SET (%I) = ROW (%L)
      WHERE
        id = $1
      RETURNING *;
    `,
    Object.keys(developerData),
    Object.values(developerData)
  );
  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };
  const queryResult: QueryResult<IDevelopers> = await client.query(queryConfig);
  return res.json(queryResult.rows[0]);
};
const deleteDevelopers = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id: number = parseInt(req.params.id);
  const queryString: string = `
    DELETE FROM
      developers
    WHERE
      id = $1;
  `;
  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };
  await client.query(queryConfig);
  return res.status(204).send();
};
const createInfo = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = parseInt(req.params.id);
    const infoData = {
      developerSince: req.body.developerSince,
      preferredOS: req.body.preferredOS,
      developerId: id,
    };
    const queryString: string = format(
      `
        INSERT INTO
          developer_infos (%I)
        VALUES
          (%L)
        RETURNING *;
      `,
      Object.keys(infoData),
      Object.values(infoData)
    );
    const queryResult: QueryResult<IInfoDevelopers> = await client.query(
      queryString
    );
    return res.status(201).json(queryResult.rows[0]);
  } catch (error) {
    if (error instanceof Error) {
      const infoData = {
        preferredOS: req.body.preferredOS,
      };
      if (infoData.preferredOS !== "Windows" || "Linux" || "MacOS") {
        return res.status(400).json({
          message: "Invalid OS option.",
          options: ["Windows", "Linux", "MacOS"],
        });
      }
    }
    return res.status(500).json({
      message: error,
    });
  }
};
const createProject = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const projectData: IProject | TProject = req.body;
  const queryString: string = format(
    `
    INSERT INTO 
      projects
    (%I)
        VALUES
    (%L)
        RETURNING *;
    `,
    Object.keys(projectData),
    Object.values(projectData)
  );
  const queryResult: QueryResult<TProjectRes | TProjRes> = await client.query(
    queryString
  );
  return res.status(201).json(queryResult.rows[0]);
};
const listProjects = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const queryString: string = `
    SELECT
      proj."id" AS "projectId",
      proj."name" AS "projectName",
      proj."description" AS "projectDescription",
      proj."estimatedTime" AS "projectEstimatedTime",
      proj."repository" AS "projectRepository",
      proj."startDate" AS "projectStartDate",
      proj."endDate" AS "projectEndDate",
      proj."developerId" AS "projectDeveloperId",
      tec.id AS "technologyId",
      tec.name AS "technologyName"
  FROM
      projects_technologies projtec
      RIGHT JOIN technologies tec ON tec.id = projtec."technologyId"
      RIGHT JOIN projects proj ON projtec."projectId" = proj."id"
  WHERE proj."id" = $1;
`;
  const queryResult: QueryResult<IProjectTechnologies> =
    await client.query<IProjectTechnologies>(queryString, [id]);
  return res.status(200).json(queryResult.rows);
};
const updateProjects = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const projectData: IUpdateProject = req.body;
  const id: number = parseInt(req.params.id);
  const queryString: string = format(
    `
      UPDATE
        projects
      SET (%I) = ROW(%L)
      WHERE
        id = $1
      RETURNING *;
    `,
    Object.keys(projectData),
    Object.values(projectData)
  );
  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };
  const queryResult: QueryResult<TProjRes | TProjectRes> = await client.query(
    queryConfig
  );
  return res.json(queryResult.rows[0]);
};
const deleteProjects = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id: number = parseInt(req.params.id);
  const queryString: string = `
    DELETE FROM
      projects
    WHERE
      id = $1;
  `;
  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };
  await client.query(queryConfig);
  return res.status(204).send();
};
const createTechnology = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id: number = parseInt(req.params.id);
  const date: Date = new Date();
  const techId: IProjetcTechnology = {
    addedIn: date,
    projectId: id,
    technologyId: res.locals.tech.idTech,
  };
  const queryString: string = format(
    `
    INSERT INTO 
        projects_technologies 
        (%I)
    VALUES 
        (%L)
    RETURNING *;
`,
    Object.keys(techId),
    Object.values(techId)
  );
  await client.query(queryString);
  const addTechnology: string = `
        SELECT
            t.id as "technologyId",
            t."name" as "technologyName",
            p.id as "projectId",
            p."name" as "projectName",
            p."description" as "projectDescription",
            p."estimatedTime" as "projectEstimatedTime",
            p."repository" as "projectRepository",
            p."startDate" as "projectStartDate",
            p."endDate" as "projectEndDate"
        FROM
            technologies t 
        LEFT JOIN 
            projects_technologies pt ON pt."technologyId" = t.id
        LEFT JOIN 
            projects p  ON pt."projectId" = p.id
        WHERE p.id = $1;
    `;
  const queryConfig: QueryConfig = {
    text: addTechnology,
    values: [techId.projectId],
  };
  const queryResult: QueryResult<IProjectTechnologies> = await client.query(
    queryConfig
  );
  return res.status(201).json(queryResult.rows[0]);
};
const deleteTechnology = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id: number = parseInt(req.params.id);
  const techId: number = Number(res.locals.queryResultt);
  const queryString: string = `
  DELETE FROM
      projects_technologies pt 
  WHERE
      pt."technologyId" = $1 AND pt."projectId" = $2
  RETURNING *;   
`;
  const queryConfig: QueryConfig = {
    text: queryString,
    values: [techId, id],
  };
  const queryResult: QueryResult = await client.query(queryConfig);
  if (queryResult.rowCount === 0) {
    return res.status(400).json({ message: "Project not found." });
  }
  return res.status(204).send();
};
export {
  createDevelopers,
  listDevelopers,
  updateDevelopers,
  deleteDevelopers,
  createInfo,
  createProject,
  listProjects,
  updateProjects,
  deleteProjects,
  createTechnology,
  deleteTechnology,
};
