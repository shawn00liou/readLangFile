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

    mapping(moduleJspn, backstageJson, frontstageJson,filename.split('.')[0]);

    filterNull(moduleJspn);


    filesJs.createFileSync(
      path.resolve(path.resolve('.', 'output', 'format', 'i18n','langs', lansgetting, filename)),
      JSON.stringify(moduleJspn, null, 2),
      'utf8',
    );

    //前台前端
    filesJs.createFileSync(
      path.resolve(path.resolve('.', 'output', 'format', 'i18n','frontstage', lansgetting, filename)),
      JSON.stringify(frontstageJson, null, 2),
      'utf8',
    );

    //後台前端
    filesJs.createFileSync(
      path.resolve(path.resolve('.', 'output', 'format', 'i18n','backstage', lansgetting, filename)),
      JSON.stringify(backstageJson, null, 2),
      'utf8',
    );

  });
  //filesJs.writeFile(filename, JSON.stringify(create, null, 2), errorHandler);
})();

function mapping(val, backstage, frontstageJson,key) {
  if (typeof backstage === typeof frontstageJson && typeof backstage === 'object') {
    Object.keys(backstage).forEach((k) => {
      const filekey=`${key}.${k}`
      if (typeof backstage[k] === 'object') {
        val[k] = val[k] || {};
        mapping(val[k], backstage[k], frontstageJson[k],filekey);
      } else if (backstage[k] === frontstageJson[k] && backstage[k].indexOf('@:') == -1 && frontstageJson[k].indexOf('@:') == -1) {
        val[k] = backstage[k];
        delete frontstageJson[k];//前台前端清除
        // backstage[k] = `@:${filekey}`;//後台前端改成@:連結
      } else if (val[k] && backstage[k].indexOf('@:') == -1 && frontstageJson[k].indexOf('@:') == -1) {
        val[k] = backstage[k] || frontstageJson[k] ;//暫時以後台前端為優先
        delete frontstageJson[k];//前台前端清除
        // backstage[k] = `@:${filekey}`;//後台前端改成@:連結
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

function filterNull(backstage) {
  Object.keys(backstage).forEach((key) => {
    if (typeof backstage[key] === 'object' && Object.values(backstage[key]).length > 0) {
      filterNull(backstage[key]);
    } else if (typeof backstage[key] === 'object' && Object.values(backstage[key]).length <= 0) {
      delete backstage[key];
    }
  });
}
