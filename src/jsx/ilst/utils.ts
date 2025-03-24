export function addInSet(argss: string[], value: any, obj: any): any {
  if (argss.length == 0) {
    return value;
  } else if (argss.length == 1) {
    const [key] = argss;

    if (isObject(obj)) {
      obj[key] = value;
      return obj;
    } else {
      return { [key]: value };
    }
  } else {
    const [first, ...other] = argss;

    if (isObject(obj)) {
      const newValue = addInSet(other, value, obj[first]);
      obj[first] = newValue;
      return obj;
    } else {
      const newValue = addInSet(other, value, null);
      return { [first]: newValue };
    }
  }
}

export function getFromSet(argss: string[], obj: any): any {
  if (isNullOrUndefined(obj)) return null;
  if (argss.length == 0) {
    return obj;
  } else if (argss.length == 1) {
    const [key] = argss;

    if (isObject(obj)) {
      const val = obj[key];
      if (isNullOrUndefined(val)) return null;
      return val;
    } else {
      return null;
    }
  } else {
    const [first, ...other] = argss;

    if (isObject(obj)) {
      return getFromSet(other, obj[first]);
    } else {
      return null;
    }
  }
}

export function mapp(data: any, f: any) {
  var tmp = [];
  for (var i = 0; i < data.length; i++) {
    tmp.push(f(data[i]));
  }
  return tmp;
}

function isObject(x: any) {
  return typeof x === "object" && !Array.isArray(x) && x !== null;
}

function isNullOrUndefined(x: any) {
  return x == null;
}

export function objectKeys(obj: any): string[] {
  var keys = [];
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      keys.push(key);
    }
  }
  return keys;
}
