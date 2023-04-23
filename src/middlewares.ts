import { Request, Response, NextFunction } from "express";
import { QueryConfig, QueryResult } from "pg";
import { client } from "./database";
import {
  IDevelopers,
  IInfoDevelopers,
  IProjectTechnologies,
  IProjetcTechnology,
  ITechnology,
  TTechs,
} from "./interfaces";
​
const checkEmailExists = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  let email = req.body.email;
  const queryString: string = `
    SELECT 
      *
    FROM 
      developers 
    WHERE 
      email = $1
  `;
  const queryConfig: QueryConfig = {
    text: queryString,
    values: [email],
  };
  const queryResult: QueryResult<IDevelopers> = await client.query(queryConfig);
​
  if (queryResult.rowCount > 0) {
    return res.status(409).json({ message: "Email already exists." });
  }
​
  return next();
};
​
const checkDeveloperExists = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const id = req.params.id;
  const queryString: string = `
    SELECT
      *
    FROM
      developers
    WHERE
      id = $1;
  `;
  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };
  const queryResult: QueryResult<IDevelopers> = await client.query(queryConfig);
  const dev: IDevelopers = queryResult.rows[0];
​
  if (queryResult.rowCount === 0) {
    return res.status(404).json({ message: "Developer not found." });
  }
​
  res.locals.dev = dev;
​
  return next();
};
​
const checkInfoExists = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const id = req.params.id;
  const queryString: string = `
    SELECT
      *
    FROM
      "developer_infos"
    WHERE
      "developerId" = $1;
  `;
  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };
  const queryResult: QueryResult<IInfoDevelopers> = await client.query(
    queryConfig
  );
​
  if (queryResult.rowCount >= 1) {
    return res.status(409).json({ message: "Developer info already exists." });
  }
​
  return next();
};
​
const checkIdExists = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  let id: number = parseInt(req.body.id);
​
  if (req.route.path === "/projects" && req.method === "POST") {
    id = req.body.developerId;
  } else if (req.route.path === "/projects/:id" && req.method === "PATCH") {
    id = req.body.developerId;
  }
  const queryString: string = `
    SELECT
      *
    FROM
      developers
    WHERE
      "id" = $1;
  `;
  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };
  const queryResult: QueryResult<IDevelopers> = await client.query(queryConfig);
​
  if (queryResult.rowCount === 0) {
    return res.status(404).json({ message: "Developer not found." });
  }
  res.locals.project = queryResult.rows[0];
​
  return next();
};
​
const checkIdProject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const id = req.params.id;
  const queryString: string = `
    SELECT
      *
    FROM
      projects
    WHERE
      "id" = $1;
  `;
  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };
  const queryResult: QueryResult<IProjectTechnologies> = await client.query(
    queryConfig
  );
​
  if (queryResult.rowCount === 0) {
    return res.status(404).json({ message: "Project not found." });
  }
​
  return next();
};
​
const checkTechExists = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const tech: ITechnology = req.body;
  const queryString: string = `
    SELECT
      *
    FROM
      technologies
    WHERE
      name = $1;
  `;
  const queryConfig: QueryConfig = {
    text: queryString,
    values: [tech.name],
  };
  const queryResult: QueryResult<TTechs> = await client.query(queryConfig);
​
  if (queryResult.rowCount > 0) {
    const result = queryResult.rows[0];
    res.locals.tech = {
      idTech: Number(result.id),
    };
  } else {
    return res.status(400).json({
      message: "Technology not supported.",
      options: [
        "JavaScript",
        "Python",
        "React",
        "Express.js",
        "HTML",
        "CSS",
        "Django",
        "PostgreSQL",
        "MongoDB",
      ],
    });
  }
​
  return next();
};
​
const checkNameExists = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const name: string = req.body.name;
  const projId: number = parseInt(req.params.id);
​
  const queryString: string = `
    SELECT
      *
    FROM
      technologies
    WHERE
      name = $1;
  `;
  const queryConfig: QueryConfig = {
    text: queryString,
    values: [name],
  };
  const queryResult: QueryResult<ITechnology> = await client.query(queryConfig);
​
  const idTech: number | undefined = queryResult.rows[0].id;
​
  const queryStringg: string = `
        SELECT 
            *
        FROM
            projects_technologies
        WHERE   
            "technologyId" = $1
        AND
            "projectId" =$2;
  `;
  const queryConfigg: QueryConfig = {
    text: queryStringg,
    values: [idTech, projId],
  };
  const queryResultt: QueryResult<IProjetcTechnology> = await client.query(
    queryConfigg
  );
​
  if (queryResultt.rowCount > 0) {
    return res.status(409).json({
      message: "This technology is already associated with the project",
    });
  }
​
  return next();
};
​
const checkNameDelete = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  let techReq = req.body;
​
  if (Object.keys(techReq).length === 0) {
    techReq = req.params;
  }
  const queryString = `
    SELECT 
      *
    FROM
      technologies
    WHERE
      name = $1;
  `;
  const queryConfig: QueryConfig = {
    text: queryString,
    values: [techReq.name],
  };
  const queryResult = await client.query(queryConfig);
​
  if (queryResult.rowCount <= 0) {
    const queryStringg = `
      SELECT
        *
      FROM
        technologies;
    `;
    const queryResultt = await client.query(queryStringg);
    const assessment = queryResultt.rows.map((event) => {
      return event.name;
    });
​
    return res.status(400).json({
      message: "Technology not supported.",
      options: assessment,
    });
  }
  res.locals.queryResultt = queryResult.rows[0].id;
​
  return next();
};
​
export {
  checkEmailExists,
  checkDeveloperExists,
  checkInfoExists,
  checkIdExists,
  checkIdProject,
  checkTechExists,
  checkNameExists,
  checkNameDelete,
};
