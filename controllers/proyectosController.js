exports.proyectosHome = (req, res)=>{
    res.render('index',{
        nombrePagina:'Proyectos'
    });
}

exports.nosotros = (req, res)=>{
    res.send('nosotros');
}