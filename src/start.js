const path = require('path');
const lansgetting = 'zh-tw';
const extend = require('extend');
const filesJs = require('./files.js');

/**
 * 繁體中文	zh-tw
 * 簡體中文	zh-cn
 * 英文	en
 * 越文	vi
 * 泰文	th
 * 馬來文	ms
 * 印尼文	id
 * 印度文	hi
 */
const headerLangKey = ['zh-cn', 'zh-tw', 'en', 'th', 'vi', 'hi'];

(function () {
  /** 來源 */
  const backstage_filelist = Object.values(
    filesJs.readdirSync(path.resolve('.', 'format', 'i18n', 'backstage', lansgetting)),
  );
  const frontstage_filelist = Object.values(
    filesJs.readdirSync(path.resolve('.', 'format', 'i18n', 'frontstage', lansgetting)),
  );
  //樣板
  // const langs_filelist = Object.values(
  //   filesJs.readdirSync(path.resolve('.', 'format', 'i18n', 'langs', lansgetting)),
  // );
  /** 後台前端檔案 跟前台前端檔案比對  要同檔案名字 */
  const filter_filelist = backstage_filelist.filter((val, ind) => {
    if (frontstage_filelist.indexOf(val) != -1) {
      return true;
    }
  });
  console.log(filter_filelist); //同時存在

  filter_filelist.forEach((filename) => {
    const backstageJson = JSON.parse(
      filesJs.readFileSync(path.resolve('.', 'format', 'i18n', 'backstage', lansgetting, filename), 'utf8'),
    );
    const frontstageJson = JSON.parse(
      filesJs.readFileSync(path.resolve('.', 'format', 'i18n', 'frontstage', lansgetting, filename), 'utf8'),
    );
    /** 從樣板抓回來 **/
    const langsJson = JSON.parse(
      filesJs.readFileSync(path.resolve('.', 'format', 'i18n', 'langs', lansgetting, filename), 'utf8'),
    );
    //每個語系的樣板,抓最大值
    let moduleJspn = {}

    headerLangKey.forEach((it,ind)=>{
      const tempJson = JSON.parse(
        filesJs.readFileSync(path.resolve('.', 'format', 'i18n', 'langs', it, filename), 'utf8'),
      );

      moduleJspn = extend(true, {} ,moduleJspn, tempJson);
    })
    moduleJspn = extend(true, {} ,moduleJspn, langsJson);//在取回目前使用的語系覆蓋
    /** */

    mapping(moduleJspn, backstageJson, frontstageJson);

    filterNull(moduleJspn);


    filesJs.createFileSync(
      path.resolve(path.resolve('.', 'output', 'format', 'i18n', lansgetting, filename)),
      JSON.stringify(moduleJspn, null, 2),
      'utf8',
    );
  });
  //filesJs.writeFile(filename, JSON.stringify(create, null, 2), errorHandler);
})();

function mapping(val, params, params2) {
  if (typeof params === typeof params2 && typeof params === 'object') {
    Object.keys(params).forEach((k) => {
      if (typeof params[k] === 'object') {
        val[k] = val[k] || {};
        mapping(val[k], params[k], params2[k]);
      } else if (params[k] === params2[k] && params[k].indexOf('@:') == -1 && params2[k].indexOf('@:') == -1) {
        val[k] = params[k];
      } else if (val[k] && params[k].indexOf('@:') == -1 && params2[k].indexOf('@:') == -1) {
        val[k] = params[k] || params2[k] ;//暫時以後台前端為優先
      }
    });
  }
}

function errorHandler(err) {
  if (err) {
    console.log(err);
    throw err;
  }
}

function filterNull(params) {
  Object.keys(params).forEach((key) => {
    if (typeof params[key] === 'object' && Object.values(params[key]).length > 0) {
      filterNull(params[key]);
    } else if (typeof params[key] === 'object' && Object.values(params[key]).length <= 0) {
      delete params[key];
    }
  });
}
