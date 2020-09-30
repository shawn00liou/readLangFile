const path = require('path');
const lansgetting = 'en';

const filesJs = require('./files.js');

(function () {
  // console.log('ini');
  const backstage_filelist = Object.values(
    filesJs.readdirSync(path.resolve('.', 'format', 'i18n', 'backstage', lansgetting)),
  );
  const frontstage_filelist = Object.values(
    filesJs.readdirSync(path.resolve('.', 'format', 'i18n', 'frontstage', lansgetting)),
  );
  //const filter_filelist = Object.values(backstage_filelist)
  const filter_filelist = backstage_filelist.filter((val, ind) => {
    if (frontstage_filelist.indexOf(val) != -1) {
      return true;
    }
  });
  console.log(filter_filelist);
  filter_filelist.forEach((filename) => {
    const backstage_zhtw = JSON.parse(
      filesJs.readFileSync(path.resolve('.', 'format', 'i18n', 'backstage', lansgetting, filename), 'utf8'),
    );
    const frontstage_zhtw = JSON.parse(
      filesJs.readFileSync(path.resolve('.', 'format', 'i18n', 'frontstage', lansgetting, filename), 'utf8'),
    );

    const create = {};
    mapping(create, backstage_zhtw, frontstage_zhtw);

    filterNull(create);
    console.log(create);

    filesJs.createFileSync(
      path.resolve(path.resolve('.', 'output', 'format', 'i18n', lansgetting, filename)),
      JSON.stringify(create, null, 2),
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
      } else if (params[k] === params2[k]) {
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
