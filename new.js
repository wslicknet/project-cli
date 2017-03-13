#!/usr/bin/env node
var fs = require('fs'),
    stat = fs.stat,
    argv = require('yargs').argv;

//dstFile文件不存在时，会自动创建
var copyFile=function (srcFile,dstFile) {
  var readable, writable;
    // 创建读取流
    readable = fs.createReadStream( srcFile );
    // 创建写入流
    writable = fs.createWriteStream( dstFile,{mode:0o777} );
    // 通过管道来传输流
    readable.pipe( writable );
};
/*
 * 复制目录中的所有文件包括子目录
 * @param{ String } 需要复制的目录
 * @param{ String } 复制到指定的目录
 */
var copy = function( src, dst ){
    // 读取目录中的所有文件/目录
    fs.readdir( src, function( err, paths ){
        if( err ){
            throw err;
        }
        paths.forEach(function( path ){
            var _src = src + '/' + path,
                _dst = dst + '/' + path;

            stat( _src, function( err, st ){
                if( err ){
                    throw err;
                }
                // 判断是否为文件
                if( st.isFile() ){
                    copyFile(_src,_dst);
                }
                // 如果是目录则递归调用自身
                else if( st.isDirectory() ){
                    exists( _src, _dst, copy );
                }
            });
        });
    });

};
// 在复制目录前需要判断该目录是否存在，不存在需要先创建目录
//src-源目录  dst-新目录名字
var exists = function( src, dst, callback ){
    fs.exists( dst, function( exists ){
        // 已存在
        if( exists ){
            callback( src, dst );
        }
        // 不存在
        else{
            //目录不存在时需要手动创建目录
            fs.mkdir( dst, function(){
                callback( src, dst );
            });
        }
    });
};

//区分文件还是目录
//若要copy的src,dst是文件，但存在同名的dst目录，会创建失败
var fileOrDir=function (src,dst,callback) {
    var lstat = fs.lstatSync(src);
    if(lstat.isFile()){
        copyFile(src,dst);
    }else{
        exists(src,dst,callback);
    }
};

// 复制目录/文件
fileOrDir( argv.src, argv.dest, copy );