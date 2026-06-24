class Disciplina {
    constructor (id, CodDisc, DTini, DTfim, N, CargH, Controle, Obrig, MatProf){
        this._id = id;
        this._CodDisc = CodDisc;
        this._DTinic = DTini;
        this._DTfim = DTfim;
        this._N = N;
        this._CargaH = CargH;
        this._Controle = Controle;
        this._Obrig = Obrig;
        this._MatProf = MatProf;
    }

  get id() { return this._id; }
  set id(valor) { this._id = valor; }

  get CodDisc() { return this._CodDisc; }
  set CodDisc(valor) { this._CodDisc = valor; }

  get DTini() { return this._DTini; }
  set DTini(valor) { this._DTini = valor; }

  get DTfim() { return this._DTfim; }
  set DTfim(valor) { this._DTfim = valor; }

  get N() { return this._N; }
  set N(valor) { this._N = valor; }

  get CargH() { return this._CargH; }
  set CargH(valor) { this._CargH = valor; }

  get Controle() { return this._Controle; }
  set Controle(valor) { this._Controle = valor; }

  get Obrig() { return this._Obrig; }
  set Obrig(valor) { this._Obrig = valor; }

  get MatProf() { return this._MatProf; }
  set MatProf(valor) { this._MatProf = valor; }
}