import {SortOrder, TableState} from "../shared/table/table.component";
import {signalState} from "@ngrx/signals";

type TableStates = {
    users: TableState;
    projects: TableState;
}

const getTableState = (filter = '', sortColumn = '', sortOrder: SortOrder = ''): TableState => {
    return {filter, sortColumn, sortOrder};
}

export const tableState = signalState<TableStates>(
    {
        users: getTableState('', 'firstName', 'asc'),
        projects: getTableState('', 'eventDate', 'asc')
    }
)
