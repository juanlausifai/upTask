export const paginate = async (model, pageSize, pageLimit, search = {}, order = [], transform) => {
    try {
        const limit = parseInt(pageLimit, 10) || 10;
        const page = parseInt(pageSize, 10) || 1;

        // crear un objeto de opciones
        let options = {
            offset: getOffset(page, limit),
            limit: limit,
        };

        // comprobar si el objeto de búsqueda está vacío
        if (Object.keys(search).length) {
            options = {options, ...search};
        }

        // compruebe si la matriz de la orden está vacía
        if (order && order.length) {
            options['order'] = order;
        }

        // toma en el modelo, toma en las opciones
        let {count, rows} = await model.findAndCountAll(options);

        // compruebe si la transformación es una función y no es nula
        if (transform && typeof transform === 'function') {
           rows = transform(rows);
        }

        return {
            previousPage: getPreviousPage(page),
            currentPage: page,
            nextPage: getNextPage(page, limit, count),
            total: count,
            limit: limit,
            data: rows
        }
    } catch (error) {
        console.log(error);
    }
}

//Pagina actual
const getOffset = (page, limit) => {
 return (page * limit) - limit;
}

//siguiente pagina
const getNextPage = (page, limit, total) => {
    if ((total/limit) > page) {
        return page + 1;
    }

    return null
}

//pagina anterior
const getPreviousPage = (page) => {
    if (page <= 1) {
        return null
    }
    return page - 1;
}