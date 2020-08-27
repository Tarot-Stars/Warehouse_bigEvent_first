$(function () {
    // 定义一个查询的参数对象，将来请求数据的时候,需要将请求参数对象提交到服务器
    var q = {
        pagenum: 1, // 页码值，默认请求第一页的数据
        pagesize: 2, // 每页显示几条数据，默认每页显示2条
        cate_id: '', // 文章分类的 Id
        state: '' // 文章的发布状态
    }
    initTable();
    // 获取文章列表数据的方法
    function initTable() {
        $.ajax({
            method: 'GET',
            url: '/my/article/list',
            data: q,
            success: function (res) {
                if (res.status !== 0) return layer.msg(res.message);
                // 使用模板引擎渲染页面的数据
                var htmlStr = template('tpl-table', res);
                $('tbody').html(htmlStr);
                renderPage(res.total);
            }
        })
    }
    // 定义美化时间的过滤器
    template.defaults.imports.dataFormat = function (date) {
        var nowDate = new Date(date);
        var nowYear = nowDate.getFullYear();
        var nowMonth = padZero(nowDate.getMonth() + 1);
        var nowDay = padZero(nowDate.getDate());
        var nowHours = padZero(nowDate.getHours());
        var nowMinute = padZero(nowDate.getMinutes());
        var nowSeconds = padZero(nowDate.getSeconds());
        return nowYear + '-' + nowMonth + '-' + nowDay + ' ' + nowHours + ':' + nowMinute + ':' + nowSeconds;
    }
    // 定义补零的函数
    function padZero(n) {
        return n > 9 ? n : '0' + n;
    }
    var layer = layui.layer;
    var form = layui.form;
    initCate();
    // 初始化文章分类的方法
    function initCate() {
        $.ajax({
            method: 'GET',
            url: '/my/article/cates',
            success: function (res) {
                if (res.status !== 0) return layer.msg();
                // 调用模板引擎渲染分类的可选项
                var htmlStr = template('tpl-cate', res);
                $('[name=cate_id]').html(htmlStr);
                // 通过 layui 重新渲染表单区域的UI结构
                form.render();
            }
        })
    }
    // 实现筛选的功能
    $('#form-search').on('submit', function (e) {
        e.preventDefault();
        // 获取表单中选中项的值
        var cate_id = $('[name=cate_id]').val();
        var state = $('[name=state]').val();
        // 为查询参数对象 q 中对应的属性赋值
        q.cate_id = cate_id;
        q.state = state;
        // 根据最新的筛选条件，重新渲染表格的数据
        initTable();
    })
    var laypage = layui.laypage;
    // 渲染分页的方法
    function renderPage(total) {
        // 调用 laypage.render() 方法来渲染分页的结构
        laypage.render({
            elem: 'pageBox', // 分页容器的 Id
            count: total, // 总数据条数
            limit: q.pagesize, // 每页显示几条数据
            curr: q.pagenum,// 设置默认被选中的分页
            layout: ['count', 'limit', 'prev', 'page', 'next', 'skip'],
            limits: [2, 3, 5, 10],// 每页展示多少条
            // 分页发生切换的时候，触发 jump 回调
            jump: function (obj, first) {
                // console.log(obj.curr);
                // 把最新的页码值，赋值到 q 这个查询参数对象中
                q.pagenum = obj.curr;
                // 把最新的条目数，赋值到 q 这个查询参数对象的 pagesize 属性中
                q.pagesize = obj.limit;
                if (!first) initTable();
            }
        })
    }
    // 通过代理的形式，为删除按钮绑定点击事件处理函数
    $('tbody').on('click', '.btn-delete', function () {
        // 获取删除按钮的个数
        var deleteNumber = $('.btn-delete').length;
        // 获取到文章的 id
        var id = $(this).attr('data-id');
        // 询问用户是否要删除数据
        layer.confirm(
            '确认删除?',
            {
                icon: 3,
                title: '提示'
            },
            function (index) {
                $.ajax({
                    method: 'GET',
                    url: '/my/article/delete/' + id,
                    success: function (res) {
                        if (res.status !== 0) return layer.msg(res.message);
                        layer.msg('删除文章成功！');
                        if (deleteNumber === 1) q.pagenum = q.pagenum === 1 ? 1 : q.pagenum - 1;
                        initTable();
                    }
                })
                layer.close(index);
            })
    })
})