import Image from "next/image";
import Link from "next/link";
import logo from '../app/images/drill-logo.png'
import temaMDDT from '../app/images/team-mddt-logo.png'


export default function Header() {
    return (
        <header className="flex px-2 py-2 justify-between">
            <div className="">
                <Link href={'/'} className="flex items-center">
                <Image src={logo} alt="MDDT" />
                <Image src={temaMDDT} alt="MDDT" />
                </Link>
                </div>
                <div>
                    <h3 className="text-white">NPO Miss Dance Drill Team International JAPAN</h3>
                    <h4 className="font-bold text-white text-right">メンバーズサイト</h4>
                </div>
        </header>
    );
}
