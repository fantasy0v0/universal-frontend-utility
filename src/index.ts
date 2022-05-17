/**
 * 异常
 */
import { catchError } from "rxjs";
import { FormGroup } from "@angular/forms";
import { HttpParams } from "@angular/common/http";

export class Exception {

  constructor(private _msg?: string, private _err?: Error) {}

  get msg() {
    return this._msg ? this._msg : "";
  }

  printStackTrace() {
    if (this._err && this._err.stack) {
      console.error(this._err.stack);
    }
  }
}

/**
 *  服务端接口响应类
 */
export class Result<T> {

  /**
   * 错误码
   */
  code!: string;

  /**
   * 错误信息
   */
  msg?: string;

  /**
   * 响应内容
   */
  data?: T;
}

/**
 * 处理异常的响应消息
 */
export function errorToException<T>() {
  return catchError<T, never>(err => {
    throw new Exception("未知错误, 请检查网络是否正常或者联系维护人员", err);
  });
}

/**
 * 异常提示
 * @param err 异常
 * @param topic 主题
 */
export function errorMessage(err: any, topic?: string) {
  let msg;
  if (err instanceof Exception) {
    msg = err.msg;
  } else {
    console.error(err);
    msg = "未知错误";
  }
  if (null != topic) {
    msg = topic + ":" + msg;
  }
  return msg;
}

/**
 * 判断接口响应是否成功
 * @param result
 */
export function checkResult<T>(result: Result<T>) {
  return "0" === result.code;
}

/**
 * 分页参数
 */
export class Paging {

  /**
   * 页码, 从1开始
   */
  pageNumber!: number;

  /**
   * 每页大小
   */
  pageSize!: number;

  public static of(pageNumber: number = 1, pageSize: number = 10) {
    let paging = new Paging();
    paging.pageNumber = pageNumber;
    paging.pageSize = pageSize;
    return paging;
  }

  public toHttpParams() {
    let params = new HttpParams();
    // 后台接口pageNum是从0开始
    let pageNumber;
    if (this.pageNumber > 0) {
      pageNumber = this.pageNumber - 1;
    } else {
      pageNumber = 0;
    }
    params = params.set("pageNumber", pageNumber.toString())
      .set("pageSize", this.pageSize.toString());
    return params;
  }

}

/**
 * 分页结果
 */
export class PagingResult<T> {

  /**
   * 总记录数
   */
  total!: number;

  /**
   * 分页记录
   */
  content!: T[];

}

/**
 * 校验表单是否非法
 * @param form 表单
 */
export function formGroupInvalid(form: FormGroup) {
  // 主动校验
  for (const key in form.controls) {
    if (null != key) {
      const control = form.controls[key];
      control.markAsDirty();
      control.updateValueAndValidity();
    }
  }
  return form.invalid;
}
