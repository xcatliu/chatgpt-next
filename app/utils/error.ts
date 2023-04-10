interface ResErrorBody {
  code: string | number;
  message: string;
}

export class ResError extends Error implements ResErrorBody {
  public code!: string | number;
  public message!: string;

  public constructor(errorBody: ResErrorBody) {
    super();

    Object.assign(this, errorBody);
  }
}
