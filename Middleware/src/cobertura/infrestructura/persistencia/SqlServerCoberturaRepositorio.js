import { Request, TYPES } from "tedious";
import { SqlExpressCriteriaParser } from "../../../compartido/infrestructura/utils/SqlExpressCriteriaParser.js";
import { Cobertura } from "../../dominio/Cobertura.js";

export class SqlServerCoberturaRepositorio {
  constructor(conexion) {
    this.conexion = conexion;
  }

  buscar = (criteria) =>
    new Promise((resolve, reject) => {
      let coberturas = [];

      let criteriaParser = new SqlExpressCriteriaParser(
        [],
        "Cobertura",
        criteria
      );
      let { consulta, parameters } = criteriaParser.parse();

      console.log(consulta);

      let request = new Request(consulta, (err, rowCount) => {
        if (err) {
          console.log("Error CoberturaRepositorio: " + err);
          reject(new Error("Error base de datos"));
        } else {
          console.log(rowCount + " rows");
        }
      });

      parameters.forEach((parameter) => {
        request.addParameter(
          parameter.get("param"),
          TYPES.VarChar,
          parameter.get("value")
        );
      });

      request.on("row", (columnas) => {
        let cobertura = new Cobertura();
        for (var name in columnas) {
          cobertura[name] = columnas[name].value;
        }
        coberturas.push(cobertura);
      });

      request.on("error", (error) => reject(error));
      request.on("doneInProc", (rowCount, more, rows) => {
        resolve(coberturas);
      });

      this.conexion.execSql(request);
    });
}
