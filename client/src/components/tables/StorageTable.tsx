//tabela arhiva

import { ArchiveDTO } from "../../models/storage/ArchiveDTO"

type Props = {
    archives: ArchiveDTO;
}

export default function StorageTable({archives}: Props){
    return (
        <table>
            <thead>
                <tr>
                    <th>Archive name</th>
                    <th>Time</th>
                    <th>Size</th>
                    <th>Download</th>                    
                    <th></th>
                </tr>
            </thead>
            {/* <tbody>
                {archives.map(a => (
                    <StorageTableRow key={a.id archive={a}}}/>
                ))}
            </tbody> */}
        </table>
    );
}