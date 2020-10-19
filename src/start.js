const path = require('path');
const lansgetting = 'en';
const extend = require('extend');
const filesJs = require('./files.js');

(function () {
  /** 來源 */
  const backstage_filelist = Object.values(
    filesJs.readdirSync(path.resolve('.', 'format', 'i18n', 'backstage', lansgetting)),
  );
  const frontstage_filelist = Object.values(
    filesJs.readdirSync(path.resolve('.', 'format', 'i18n', 'frontstage', lansgetting)),
  );
  //樣板
  const langs_filelist = Object.values(
    filesJs.readdirSync(path.resolve('.', 'format', 'i18n', 'langs', lansgetting)),
  );
  /** 後台前端檔案 跟前台前端檔案比對  要同檔案名字 */
  const filter_filelist = backstage_filelist.filter((val, ind) => {
    if (frontstage_filelist.indexOf(val) != -1) {
      return true;
    }
  });
  console.log(filter_filelist);//同時存在

  filter_filelist.forEach((filename) => {
    const backstageJson = JSON.parse(
      filesJs.readFileSync(path.resolve('.', 'format', 'i18n', 'backstage', lansgetting, filename), 'utf8'),
    );
    const frontstageJson = JSON.parse(
      filesJs.readFileSync(path.resolve('.', 'format', 'i18n', 'frontstage', lansgetting, filename), 'utf8'),
    );
    //從樣板抓回來
    const langsJson = JSON.parse(
      filesJs.readFileSync(path.resolve('.', 'format', 'i18n', 'langs', lansgetting, filename), 'utf8'),
    );

    const create = {};
    mapping(create, backstageJson, frontstageJson);

    filterNull(create);
    console.log(create)
    const i18nMergeJson = extend(true, {}, langsJson, create);


    filesJs.createFileSync(
      path.resolve(path.resolve('.', 'output', 'format', 'i18n', lansgetting, filename)),
      JSON.stringify(i18nMergeJson, null, 2),
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
      } else if (params[k] === params2[k] && params[k].indexOf('@:')==-1 && params2[k].indexOf('@:')==-1) {
        val[k] = params[k];
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
