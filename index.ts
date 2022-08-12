import { FormArray, FormGroup } from "@angular/forms";
import { HttpParams } from "@angular/common/http";
import { catchError } from "rxjs/operators";

/**
 * 异常
 */
export class Exception {

  constructor(private _msg?: string, private _err?: Error) {}

  get msg() {
    return this._msg ? this._msg : "";
  }

  get error() {
    return this._err;
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
 * 判断接口响应是否成功, 如果成功则返回结果中的data, 如果失败则抛出异常
 * @param result 响应结果
 * @return 返回响应结果中的data
 */
export function checkResult<T>(result: Result<T>) {
  if ("0" !== result.code) {
    throw new Exception(result.msg);
  }
  return result.data;
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
    // 后台接口pageNumber是从0开始
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
  _formGroupValid(form);
  return form.invalid;
}

/**
 * 将FormGroup中的所有Control标记为Dirty
 * @param formGroup formGroup
 */
function _formGroupValid(formGroup: FormGroup) {
  for (const key in formGroup.controls) {
    const control = formGroup.controls[key];
    if (control instanceof FormArray) {
      _formArrayValid(control);
    } else if (control instanceof FormGroup) {
      _formGroupValid(control);
    } else {
      control.markAsDirty();
      control.updateValueAndValidity();
    }
  }
}

/**
 * 将FormArray中的所有Control标记为Dirty
 * @param array array
 */
function _formArrayValid(array: FormArray) {
  for (const control of array.controls) {
    if (control instanceof FormArray) {
      _formArrayValid(control);
    } else if (control instanceof FormGroup) {
      _formGroupValid(control);
    } else {
      control.markAsDirty();
      control.updateValueAndValidity();
    }
  }
}

/**
 * 睡眠指定毫秒数
 * @param millis 毫秒数
 */
function sleep(millis: number) {
  return new Promise(resolve => {
    setTimeout(resolve, millis);
  });
}